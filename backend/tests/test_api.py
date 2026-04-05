def test_get_jobs(client):
    rv = client.get('/api/jobs?page=0&size=10')
    assert rv.status_code == 200
    assert 'jobs' in rv.json