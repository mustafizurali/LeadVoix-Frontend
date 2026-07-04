from fastapi import FastAPI

app = FastAPI(title="LeadVoix OS API")


@app.get("/")
def root():
    return {"message": "LeadVoix OS API is running"}