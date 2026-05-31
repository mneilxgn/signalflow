import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
