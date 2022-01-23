from fastapi import FastAPI;
from fastapi.middleware.cors import CORSMiddleware;
from fastapi.responses import FileResponse;
import base64;
from PIL import Image;
from io import BytesIO;
from pydantic import BaseModel;

class baseItem (BaseModel):
  image_string: str


app = FastAPI()

origins = [
  "http://127.0.0.1:8000/",
  "http://127.0.0.1:5500/",

  "http://127.0.0.1",
  "http://127.0.0.1",
  "http://localhost",
  "http://localhost:5500/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,   # 追記により追加
    allow_methods=["*"],      # 追記により追加
    allow_headers=["*"]    
)

@app.get('/')
async def root():
  return{"message":"hellow world"}

@app.post("/uploadbase64")
async def post_base64Image(baseItem:baseItem):
  imgdata =base64.b64decode(baseItem.image_string) 
  img = Image.open(BytesIO(imgdata))

  out_jpg = img.convert('RGB')
  out_jpg.save("saved.jpg")
  
  return {"base64code":baseItem.image_string}

