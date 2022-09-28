import { history } from 'umi';

export default function () {
    return (<div>
        <button onClick={() => window.open(window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__)}>
            独立打开
        </button>
        <div
            onClick={() => history.push('/productNew?id=134&tenantId=265100&userWorkId=1381820161490731009&reserveId=null&blade-auth=bearer%20eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJpc3N1ZXIiLCJhdWQiOiJhdWRpZW5jZSIsInRlbmFudF9pZCI6IjI2NTEwMCIsInJvbGVfbmFtZSI6IiIsIm1haW5EZXB0SWQiOiIxMzM5NDg0NjQzMTc0NjM3NTY5IiwidXNlcl9pZCI6IjEzMzk0ODQ2NDM1NDM2NjY2ODkiLCJyb2xlX2lkIjoiMTQxNDQ4NTI5Mjc0NTI5MzgyNSwxMzk5NzE2MDEzMDc2NDQ3MjM0IiwidXNlcl9uYW1lIjoiYWRtaW4iLCJvYXV0aF9pZCI6IiIsInNlbnNpdGl2ZUZsYWciOiJmYWxzZSIsInRva2VuX3R5cGUiOiJhY2Nlc3NfdG9rZW4iLCJhY2NvdW50IjoiYWRtaW4iLCJjbGllbnRfaWQiOiJzYWFzIiwiZXhwIjoxNjYzMjQwNTk1LCJuYmYiOjE2NjMyMzY5OTV9.9NM1SJvOlhCG31kkOLa3NmWdZgfrr8uBtAoC2Zs8rl3V7zURM0-JvrM6E4c7xC4wKvk1RVQSZ7RObk7aES1kog&parm=aL0We0l7fC6a')}>product++
        </div>
    </div>
    );
}
