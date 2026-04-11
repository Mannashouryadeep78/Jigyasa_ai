from langgraph.graph import StateGraph, START, END
from graph.state import InterviewState
from graph.nodes import (
    greeter, question_selector, responder,
    followup_decider, edge_case_handler, closer, assessor
)
from graph.edges import (
    route_from_start, decide_followup
)

from langgraph.checkpoint.postgres import PostgresSaver
import psycopg
import os

DATABASE_URL = os.getenv("DATABASE_URL")

def build_graph():
    builder = StateGraph(InterviewState)
    
    # Add nodes
    builder.add_node("greeter", greeter)
    builder.add_node("question_selector", question_selector)
    builder.add_node("responder", responder)
    builder.add_node("followup_decider", followup_decider)
    builder.add_node("edge_case_handler", edge_case_handler)
    builder.add_node("closer", closer)
    builder.add_node("assessor", assessor)
    
    # Edges
    builder.add_conditional_edges(START, route_from_start, {
        "greeter": "greeter",
        "question_selector": "question_selector",
        "followup_decider": "followup_decider",
        "assessor": "assessor",
        "END": END
    })
    
    builder.add_edge("greeter", END)
    builder.add_edge("question_selector", END)
    builder.add_edge("responder", END)
    builder.add_edge("edge_case_handler", END)
    
    builder.add_conditional_edges(
        "followup_decider",
        decide_followup,
        {
            "edge_case_handler": "edge_case_handler",
            "question_selector": "question_selector",
            "responder": "responder",
            "closer": "closer"
        }
    )
    
    builder.add_edge("closer", "assessor")
    builder.add_edge("assessor", END)
    
    # ── PostgreSQL Checkpointer ─────────────────────────────────────────────
    # Sessions survive server restarts and can run on multiple workers.
    # DATABASE_URL must be a Supabase Postgres connection string (Transaction
    # mode pooler recommended: postgresql://postgres.[ref]:[pwd]@aws-0-[region]
    # .pooler.supabase.com:6543/postgres)
    conn = psycopg.connect(DATABASE_URL, autocommit=True)
    memory = PostgresSaver(conn)
    memory.setup()  # Creates the LangGraph checkpoint tables if they don't exist
    graph = builder.compile(checkpointer=memory)
    return graph

# Export a compiled instance
interview_graph = build_graph()
