# Study Journal: Refactoring & fixes

## Date: 2026-03-07
**Git Commit Message:** `Refactor: move get_user_by_id to user_service, fix admin route circular imports`

### The "Circular Import" Problem (Explained Like You're 5)

Imagine you are trying to build a Lego house. 

**File A (Admin Service)** is the builder.
**File B (User Service)** is the instruction manual.

The builder (File A) says: "I need to open the manual (File B) to find out how to build the roof."
But inside the manual (File B), the first page says: "Before you read this, ask the builder (File A) for a pen."

They are stuck! The builder can't build the roof because he can't read the manual. The manual can't be read because it's waiting for the builder to hand over a pen. They just stand there staring at each other forever. This "staring forever" is what Python calls an `ImportError: cannot import name`.

**How we fixed it:**
We changed the rules. We moved the "pen" to a completely different table (a separate place inside `user_service.py`). 
Now, the manual (File B) doesn't need to look at the builder (File A) at all. It just works. And the builder (File A) can open the manual (File B) safely. 

*Rule of thumb: Never let two files point at each other at the top of the page.*
