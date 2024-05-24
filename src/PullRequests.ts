import { context, getOctokit } from "@actions/github";

interface PullRequestDetailsResponse {
  repository: {
    pullRequest: {
      baseRef: {
        name: string;
        target: {
          oid: string;
        };
      };
    };
  };
}

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

  const {
    repository: {
      pullRequest: {
        baseRef,
      },
    },
  } = await client.graphql<PullRequestDetailsResponse>(
    `
      query pullRequestDetails($repo:String!, $owner:String!, $number:Int!) {
        repository(name: $repo, owner: $owner) {
          pullRequest(number: $number) {
            baseRef {
              name
              target {
                oid
              }
            }
          }
        }
      }
    `,
    {
      ...context.repo,
      number: context.issue.number
    },
  );
  
  console.log("baseRef name:", baseRef.name);
  console.log("baseRef target oid:", baseRef.target.oid);

  return {
    base_ref: baseRef.name,
    base_sha: baseRef.target.oid,
  };
}