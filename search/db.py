from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import VectorStore
from langchain.vectorstores.cassandra import Cassandra

from cassandra.auth import PlainTextAuthProvider
from cassandra.cluster import Cluster, Session

import os


def get_session(scb: str) -> Session:
    """
    Connect to Astra DB using secure connect bundle and credentials.

    Args:
        scb: str
            Path to secure connect bundle.
    """

    cloud_config = {
        "secure_connect_bundle": scb,
        "use_default_tempdir": True # To make it work on vercel
    }

    CLIENT_ID = os.environ["ASTRA_DB_CLIENT_ID"]
    CLIENT_SECRET = os.environ["ASTRA_DB_CLIENT_SECRET"]

    auth_provider = PlainTextAuthProvider(CLIENT_ID, CLIENT_SECRET)
    cluster = Cluster(cloud=cloud_config, auth_provider=auth_provider)
    return cluster.connect()


def get_vector_store(scb: str, keyspace: str, table: str) -> VectorStore:
    """Build and get the Astra DB vector store"""
    session = get_session(scb)
    embeddings = OpenAIEmbeddings()
    vstore = Cassandra(embedding=embeddings,
                       session=session,
                       keyspace=keyspace,
                       table_name=table)
    return vstore
