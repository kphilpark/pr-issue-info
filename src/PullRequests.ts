import { context, getOctokit } from "@actions/github";

export async function isPullRequest(token: string) {
  const client = getOctokit(token);

  const { data: { pull_request } } = await client.rest.issues.get({
    ...context.repo,
    issue_number: context.issue.number,
  });

  return !!pull_request;
}

export async function pullRequestDetails(token: string) {
  const client = getOctokit(token);

  const { data: pullRequest } = await client.rest.pulls.get({
    ...context.repo,
    pull_number: context.issue.number,
  });

  const baseRef = pullRequest.base.ref;
  const baseSha = pullRequest.base.sha;
  const headRef = pullRequest.head.ref;
  const headSha = pullRequest.head.sha;

  console.log("baseRef name:", baseRef);
  console.log("baseRef sha:", baseSha);
  console.log("headRef name:", headRef);
  console.log("headRef sha:", headSha);

  return {
    base_ref: baseRef,
    base_sha: baseSha,
    head_ref: headRef,
    head_sha: headSha,
  };
}
