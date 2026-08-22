import sys
import os

# Add the 'backend' directory to sys.path so that absolute imports within backend (like 'data.db') work.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend"))

from backend.main import app
