from fastapi import FastAPI
from langserve import add_routes

import dotenv
from search import search, db

dotenv.load_dotenv()

vector_store = db.get_vector_store(
    scb="./config/secure-connect-multilingual.zip",
    keyspace="ecommerce",
    table="central_openai_en",
)
chain = search.build_search_chain(vector_store)

app = FastAPI(
    title="AI-powered product search",
)

add_routes(
    app,
    chain,
    path="/api/search"
)