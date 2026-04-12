from langgraph.graph import StateGraph, START, END
from graph.state import InterviewState
from graph.nodes import (
    greeter, question_selector, responder,
    followup_decider, edge_case_handler, closer, assessor
)
from graph.edges import (
    route_from_start, decide_followup
)
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
    
    # ── Checkpointer ─────────────────────────────────────────────────────────
    # Production: PostgreSQL via DATABASE_URL env var
    # Local dev: MemorySaver (in-process, zero config, always compatible schema)
    #            SQLite is avoided because its on-disk schema can become stale
    #            across LangGraph upgrades, causing KeyError: '__start__'.
    placeholder = "YOUR_DB_PASSWORD_HERE"
    if DATABASE_URL and placeholder not in DATABASE_URL:
        try:
            import psycopg
            from langgraph.checkpoint.postgres import PostgresSaver
            conn = psycopg.connect(DATABASE_URL, autocommit=True)
            memory = PostgresSaver(conn)
            memory.setup()
            print("[OK] Checkpointer: PostgreSQL (production mode)")
        except Exception as e:
            print(f"[WARN] PostgreSQL connection failed ({e}), falling back to MemorySaver.")
            from langgraph.checkpoint.memory import MemorySaver
            memory = MemorySaver()
    else:
        print("[INFO] DATABASE_URL not set — using MemorySaver (local dev mode)")
        from langgraph.checkpoint.memory import MemorySaver
        memory = MemorySaver()

    graph = builder.compile(checkpointer=memory)
    return graph

# Export a compiled instance
interview_graph = build_graph()
