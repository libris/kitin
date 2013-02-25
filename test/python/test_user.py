from storage import User

def test_user_is_active_by_default():
    assert User("username").is_active
