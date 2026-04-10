from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from graph.state import InterviewState
from graph.nodes import (
    greeter, question_selector, responder, 
    followup_decider, edge_case_handler, closer, assessor
)
from graph.edges import (
    route_from_start, decide_followup
)

from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

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
    
    # Compile with persistent storage so /resume works across server restarts!
    memory = SqliteSaver.from_conn_string("checkpoints.db")
    graph = builder.compile(checkpointer=memory)
    return graph

# Export a compiled instance
interview_graph = build_graph()
