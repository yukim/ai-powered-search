from langchain.chains.openai_functions import create_structured_output_runnable
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import Document
from langchain.schema.runnable import Runnable, RunnableLambda
from langchain.vectorstores import VectorStore
from pydantic.v1 import BaseModel, Field
from typing import List, Dict, Optional

import langchain
import json

langchain.debug = True

categories = {}
with open('./data/categories.json', 'r') as f:
    data = json.load(f)
    for (thai, eng) in data:
        categories[eng] = thai

brands_by_category: Dict[str, str] = {}
with open('./data/brands_by_category.json', 'r') as f:
    brands_by_category = json.load(f)


def available_categories() -> List[str]:
    return categories.keys()


def get_brands(category: str) -> List[str]:
    thai = categories.get(category, None)
    return brands_by_category.get(thai, [])


class ProductSearchQuery(BaseModel):
    """Query model to search products, 
    """
    original_query: str = Field(..., description="Query that the user typed")
    product_category: str = Field(
        ..., description=f"Product category. Available categories: {available_categories()}")
    brand: Optional[str] = Field("", description="Product's brand name")
    specs: Dict[str, str] = Field(
        {}, description=f"Product's specifications.")

    class Config:
        arbitrary_types_allowed = True


def build_search_chain(vector_store: VectorStore) -> Runnable:
    """Build a chain that extracts the features from the user query, searches for relevant products,
    and generates a response in JSON format: 

    The chain consists of the following steps:
    * Prompt to extract product features from the user query
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful customer service of a home improvement store and you are asked to pick products for a customer."
         "Translate the query to English if it is not in English.\n"
         "Extract the product category, brand name, and product specs such as size, color, etc from the following query.\n"),
        ("human", "{query}"),
    ])
    llm = ChatOpenAI(model="gpt-4-1106-preview", temperature=0)

    def search_products(query: ProductSearchQuery):
        """
        Useful when searching for products from a product description.
        Prices are in THB. When calling this tool, include as much detail as possible,
        and translate arguments to English.

        Args:
            query: Product description
        """
        q = str(dict(query))
        filter = {}
        if query.brand:
            filter["brand"] = query.brand
        if query.product_category and query.product_category in categories:
            # categories are in Thai
            filter["product_categories"] = categories[query.product_category]
        documents = vector_store.similarity_search_with_relevance_scores(
            q, k=10, score_threshold=0.8, filter=filter)

        def to_product(document: Document, score: float):
            ret = {}
            for k, v in document.metadata.items():
                ret[k] = v
            ret["score"] = str(score)
            return ret
        return [to_product(d, s) for (d, s) in documents]

    runnable = create_structured_output_runnable(
        ProductSearchQuery, llm, prompt)
    return runnable | {
        "products": RunnableLambda(search_products),
        "query": RunnableLambda(lambda p: dict(p)),
        "available_brands": RunnableLambda(lambda p: get_brands(p.product_category)),
    }
