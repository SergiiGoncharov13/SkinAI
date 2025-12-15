from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(...)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=4)


class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True
