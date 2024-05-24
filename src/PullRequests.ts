import { context, getOctokit } from "@actions/github";

interface PullRequestDetailsResponse {
  repository: {
    pullRequest: {
      headRef: {
        name: string;
        target: {
          oid: string;
        };
      };      
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

  const variables = {
    repo: context.repo.repo,
    owner: context.repo.owner,
    number: context.issue.number,
  };

  console.log(variables); // 변수 값 확인

  const result = await client.graphql<PullRequestDetailsResponse>(
    `
      query pullRequestDetails($repo: String!, $owner: String!, $number: Int!) {
        repository(name: $repo, owner: $owner) {
          pullRequest(number: $number) {
            baseRef {
              name
              target {
                oid
              }
            }
            headRef {
              name
              target {
                oid
              }
            }
          }
        }
      }
    `,
    variables,
  );

  console.log(result); // 쿼리 결과 확인

  const {
    repository: {
      pullRequest,
    } = {}, // 기본값을 빈 객체로 설정
  } = result;

  if (!pullRequest) {
    throw new Error("Pull request not found or unauthorized access.");
  }

  const { baseRef, headRef } = pullRequest;

  if (!baseRef || !headRef) {
    console.error("BaseRef or HeadRef is null.");
    console.error("Result:", result);
    throw new Error("Failed to retrieve pull request details.");
  }

  console.log("baseRef name:", baseRef.name);
  console.log("baseRef target oid:", baseRef.target.oid);
  console.log("headRef name:", headRef.name);
  console.log("headRef target oid:", headRef.target.oid);

  return {
    base_ref: baseRef.name,
    base_sha: baseRef.target.oid,
    head_ref: headRef.name,
    head_sha: headRef.target.oid,
  };
}

// export async function pullRequestDetails(token: string) {
//   const client = getOctokit(token);

//   const {
//     repository: {
//       pullRequest: {
//         headRef,
//         baseRef,
//       },
//     },
//   } = await client.graphql<PullRequestDetailsResponse>(
//     `
//       query pullRequestDetails($repo:String!, $owner:String!, $number:Int!) {
//         repository(name: $repo, owner: $owner) {
//           pullRequest(number: $number) {
//             headRef {
//               target {
//                 oid
//               }
//             }
//             baseRef {
//               name
//               target {
//                 oid
//               }
//             }
//           }
//         }
//       }
//     `,
//     {
//       ...context.repo,
//       number: context.issue.number
//     },
//   );
  
//   console.log("baseRef name:", baseRef.name);
//   console.log("baseRef target oid:", baseRef.target.oid);

//   return {
//     head_ref: headRef.name,
//     head_sha: headRef.target.oid,
//     base_ref: baseRef.name,
//     base_sha: baseRef.target.oid,
//   };
// }
