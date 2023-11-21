if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.index:app", host="localhost", port=8000, reload=True)
