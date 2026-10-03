# Travel Bug Tours AWS deployment

This folder contains two small AWS CloudFormation/SAM stacks:

- `hosting.yaml` hosts the static website in a private S3 bucket behind
  CloudFront.
- `template.yaml` accepts contact-form enquiries and forwards them by email.

Neither stack needs a database or a continuously running server.

## One-time hosting setup

1. Decide which of your two names is canonical: `example.com` or
   `www.example.com`. Both names should be included in one ACM certificate.
2. In the **us-east-1 (N. Virginia)** AWS Region, request a public ACM
   certificate for both names and complete its DNS validation. CloudFront only
   accepts certificates from this region.
3. Deploy `hosting.yaml` in the same region, passing the certificate ARN and
   both domain names. It creates a private bucket and CloudFront distribution.
4. Pass the Route 53 hosted-zone ID to the stack. The stack creates IPv4 and
   IPv6 alias records for both names and redirects the secondary name to the
   primary one.
5. Run `deploy-site.ps1` with the returned bucket name and distribution ID.

The bucket is deliberately not a public S3 website bucket: CloudFront is the
only service allowed to read it.

## Contact-form setup

`template.yaml` is a small AWS SAM application. It accepts the contact form,
validates it, and uses Amazon SES to email the enquiry to Amanda. It does not
store visitor details in a database.

## Before deployment

1. Verify `SenderEmail` in Amazon SES. Using an address on the site domain is
   preferable, but `exploretravelbugtours@gmail.com` can be verified for an
   initial launch.
2. Request Amazon SES production access in the AWS Region that will host this
   stack. SES sandbox accounts can only send to verified recipients.
3. Decide the final public site origin, including `www` or no `www`, because
   this is the only site allowed to call the API.

## Deploy the contact form

Install the AWS SAM CLI, sign in to AWS with an account that can create
CloudFormation, Lambda, API Gateway, IAM and SES resources, then run from this
folder:

```powershell
sam build
sam deploy --guided
```

Use the following guided-deploy parameter values. Use the final canonical URL
only, including `https://` and either `www` or no `www`:

- `SenderEmail`: the verified SES sending address
- `SenderIdentity`: the verified SES domain that authorizes `SenderEmail`
- `RecipientEmail`: `exploretravelbugtours@gmail.com`
- `AllowedOrigin`: for example `https://www.example.com`

After deployment, copy the `EnquiryEndpoint` output into
`assets/js/config.js` as `inquiryEndpoint`, then publish the website (see
"Publishing from GitHub" below).

## Publishing from GitHub

`github-publish.yaml` lets the "Publish to live site" GitHub Actions workflow
(`.github/workflows/publish.yml`) upload to the bucket and clear CloudFront. It
uses GitHub's OIDC sign-in, so no AWS keys are stored anywhere, and the role
only trusts jobs in the repository's `live` environment.

An account can have only one GitHub OIDC provider. Check first:

```powershell
aws iam list-open-id-connect-providers
```

If `token.actions.githubusercontent.com` is listed, pass
`CreateOidcProvider=false` below.

```powershell
aws cloudformation deploy `
  --region us-east-1 `
  --stack-name travelbug-github-publish `
  --template-file infrastructure/github-publish.yaml `
  --capabilities CAPABILITY_IAM `
  --parameter-overrides WebsiteBucketName=<WebsiteBucketName> DistributionId=<DistributionId>
```

Then set three repository variables on GitHub (Settings → Secrets and
variables → Actions → Variables), or from the terminal:

```powershell
gh variable set AWS_PUBLISH_ROLE_ARN --body <PublishRoleArn output>
gh variable set AWS_BUCKET --body <WebsiteBucketName>
gh variable set AWS_DISTRIBUTION_ID --body <DistributionId>
```

`deploy-site.ps1` remains as a manual fallback; it builds the site first.

## Protection and operations

The endpoint permits requests only from the chosen browser origin, validates
input, has a hidden honeypot field, and API Gateway has a conservative global
rate limit. CORS does not by itself stop scripted abuse, so if unwanted
submissions become a problem, add CAPTCHA or AWS WAF before raising the rate
limit. Do not put access keys, SES credentials, or private email settings in
the website files.

Set an AWS Budget alert (for example, $5/month) and review CloudWatch errors
after launch. Enquiries are retained only in Amanda's mailbox, so the website
privacy policy should state that the form collects contact and trip-planning
information for responding to an enquiry.
