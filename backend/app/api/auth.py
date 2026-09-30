import uuid

from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse

from app.auth import current_user
from app.core.config import get_settings
from app.db import database

router = APIRouter(prefix="/auth", tags=["auth"])
oauth = OAuth()
oauth.register("google", client_id=get_settings().google_client_id, client_secret=get_settings().google_client_secret, server_metadata_url="https://accounts.google.com/.well-known/openid-configuration", client_kwargs={"scope": "openid email profile"})


@router.get("/google")
async def google_login(request: Request) -> RedirectResponse:
    return await oauth.google.authorize_redirect(request, get_settings().google_callback_url)


@router.get("/google/callback")
async def google_callback(request: Request) -> RedirectResponse:
    token = await oauth.google.authorize_access_token(request)
    profile = token.get("userinfo") or await oauth.google.userinfo(token=token)
    email = str(profile["email"]).lower()
    db = database()
    user = await db.users.find_one({"email": email})
    if not user:
        user_id = str(uuid.uuid4())
        await db.users.insert_one({"_id": user_id, "email": email, "display_name": profile.get("name", email.split("@")[0]), "avatar_url": profile.get("picture", "")})
    else:
        user_id = str(user["_id"])
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"display_name": profile.get("name", user.get("display_name", email.split("@")[0])), "avatar_url": profile.get("picture", user.get("avatar_url", ""))}})
    request.session["user_id"] = user_id
    return RedirectResponse(f"{get_settings().client_url}/dashboard")


@router.post("/logout")
async def logout(request: Request) -> dict:
    request.session.clear()
    return {"success": True, "data": {"logged_out": True}}


@router.get("/me")
async def me(user: dict = Depends(current_user)) -> dict:
    data = {"_id": str(user["_id"]), "id": str(user["_id"]), "email": user["email"], "display_name": user.get("display_name", ""), "photo_url": user.get("avatar_url", "")}
    return {"success": True, "data": data, "user": data}
