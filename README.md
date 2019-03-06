# test-cloud-function

This repo is an example of an adenin cloud function repository. This readme will cover the cloud function repository structure and functionality, associated node modules, and instructions for running the functions on local environments as well as deployment to cloud providers.

## Generate

A new cloud function repository should be created via the [cloud-connector](https://www.npmjs.com/package/@adenin/generator-cloud-function ) Yeoman generator. 

First install Yeoman and the generator:

```bash
npm install -g yo
npm install -g @adenin/generator-cloud-function
```

Now, to work towards recreating this repository, generate a new project as follows:

```bash
# first cd into the desired directory to create your repository in
# then run
yo @adenin/cloud-function test2-cloud-connector hello:empty now:empty
```

The first argument that the generator takes is the desired repository name, it then takes a space-separated list of desired activities in the format `{name}:{template}` - name being the desired name for the activity, and template being one of the generator's activity templates (currently _sql_, _card_, or _empty_).

When the command has run you should end up with a project that mirrors this repo exactly, only without the correct logic implemented within `hello.js` and `now.js` - the generato will have already run `npm install` for you, so the project is now ready to use.

It is also possible to generate a project using a command-line prompting interface by simply running the command without arguments.

If you want to add an additional activity template to an existing repo, use the activity subgenerator:

```bash
cd test2-cloud-function

yo @adenin/cloud-function:activity myactivity:empty
```

## Project Structure

In the project root, `index.js` is where the cloud function entrypoint is exported, under the named export `function`. Then `app.js` is the local Koa server that can be used to test activities prior to deployment.

The activity scripts themselves should all be placed in the `/activities` folder - every javascript file within this folder will be made accessible from the cloud function, so it should only contain functions that you desire to export as entrypoints. Any helper scripts that these functions need to use should instead be stored in the `/common` subdirectory. 

The `function.json` is for Azure functions and defines the way the deployed function should behave, it must remain in place and should probably not be modified unless explicitly required.

## Implement

To finish creating our mirror of this repository, we now need to implement the functionality of the _hello_ and _now_ activities. Open `hello.js` and `now.js` and replace the contents of the `try` block with the following...

>For this example we will just implement the behaviour directly, rather than using helper functions like the `/common/utils.js` scripts used in this repo for demonstration.

In `now.js`:
```js
activity.Response.Data = new Date().toISOString();
```

In `hello.js`:
```js
activity.Response.Data = 'hello, ' + activity.Request.Path;
```

## Run locally

There are two ways to access your repository's activities locally.

### In-repo dev server

To use the `app.js` server within the repo itself, run the following commands:

```bash
cd test2-cloud-function

# run dev server (hot reload on save)
npm run dev

# run production
node app.js
```

An alternative way to run the server in development mode is to set `NODE_ENV=development`, which will enable decaching - meaning that upon each request, the server will reload files from `/activities` prior to execution, so the most recently saved changes to activity implementations will take effect without having to reboot the server.

Setting `NODE_ENV=development` will also turn on all log statements from the [cf-logger](https://www.npmjs.com/package/@adenin/cf-logger) - otherwise, logging behaviour must be configured through the `LOG_FILTER` environment variable. See readme of _cf-logger_ for details. As the [cf-provider](https://www.npmjs.com/package/@adenin/cf-provider) which this repo utilises also uses the _cf-logger_, these log settings will take effect for code executed within that module also.

The server will run on `http://localhost:4000` - to send a request to the _now_ activity for example, we would send a post request to `http://localhost:4000/now` with the following body:

```json
{
    "Context": {},
    "Request": {},
    "Response": {}
}
```

Alternatively you can of course configure the [cloud-function-connector](https://github.com/NowAssistant/cloud-function-connector) within adenin workplace manager to send requests from there.

If sending a request with an API key in the header, remember to set the `API_KEYS` environment variable on the server to a semicolon-delimited list of accepted keys.

### Multi-repo cf-server

There is also a more dedicated local server provided by the [cf-server](https://gitlab.com/adenin-team/cf-server) repo. It functions much the same way as the local server except is also capable of serving multiple function repos at once at endpoints in the format `/{repo}/{activity}`.

Simply clone the cf-server repo into the directory that this project is also sitting in - ensure that directory contains nothing but the cf-server folder and then your cloud connector folders. If you need to add directories that are not cloud function repos, you must prefix the directory name with `_` or `.` to prevent the server from attempting to serve the directory as a function repo.

You can then run the server by doing `cd` into the cf-server folder then using the same run commands and configuration as for the repo's own dev server discussed above. It can also be run as an IIS service using the provided `web.config`. See the readme of cf-server repo for more detailed information.

## Deploying to cloud providers

The repo currently supports 3 function-as-a-service providers: AWS Lambda, Google Cloud Functions, and Azure functions. Create accounts with each of these providers before continuing

### Google Cloud Functions

Install the [Google Cloud Platform CLI](https://cloud.google.com/sdk) and configure with your account details. Create a new 'project' in the GCP admin console and set as default. Deployment can then be done via:

```bash
cd test2-cloud-connector

gcloud functions deploy test2 --entry-point activities --trigger-http --runtime nodejs8
```

Here _test2_ is the name your function will be given after deployment, and 'activities' is the name of the entrypoint for execution - this should not be changed and will remain the same for all cloud function repos.

The function will then be assigned to an HTTP endpoint, in this case:

`https://us-central1-adenin-gcp-poc.cloudfunctions.net/test2`

This is because my default project name was set to _adenin-gcp-poc_. You may now want to set `API_KEYS` and any other environment variables in the function's settings within the admin console. Save and wait for the redeployment to complete,before testing our two activities via requests to the following endpoints:

`https://us-central1-adenin-gcp-poc.cloudfunctions.net/test2/now`

`https://us-central1-adenin-gcp-poc.cloudfunctions.net/test2/hello`

### AWS Lambda

Similar to GCP, you will first need to set up the [AWS CLI](https://aws.amazon.com/cli/) and authenticate it with your AWS account login.

As AWS deployment requires a `.zip` file, you may also want to install and configure [7zip CLI](https://www.7-zip.org/) (Windows), or equivalent for your OS. 

Once the environment is configured, the functions can be deployed to AWS Lambda as follows:

```bash
cd test2-cloud-connector

7z a -tzip index.zip ./

aws lambda create-function --function-name test2 --runtime nodejs8.10 --role <aws_role_number> --handler index.activities --zip-file fileb://index.zip

rm ./index.zip
```

Here, `index.activities` again refers to the execution entrypoint from `index.js`.

The `<aws_role_number>` will be specific to your account, and will require you to set up an [IAM role](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) with Lambda execution privileges from the AWS console.

The function will require a HTTP trigger to be set up in an additional step. To do this, go to the AWS console and navigate to 'API gateway'. Create a new API with a name of your choice, then 'create resource' and give it a name and resource path of _test2_.

Select the newly created resource and again press 'create resource' to create a child of _test2_, giving this one the name _activity_ and resource path of _{activity}_.

Select the new _activity_ resource and then press 'create method', select 'any', and then in the configuration screen that appears make sure to choose 'integration type: lambda function', tick 'use lambda proxy integration', then in `lambda function' enter 'test2'.

To find the associated endpoint, now go to the lambda function manager, select the 'test2' function, select 'API gateway' and you should see the API endpoint displayed toward the bottom of the page, which will look like this:

`https://4dmy5ia8ae.execute-api.us-east-2.amazonaws.com/default/test2/:activity`

While you are in the function manager, you may again want to configure environment variables such as `API_KEYS` and `LOG_FILTER`. Remember to save before leaving the manager.

## Azure Functions

Azure also requires the module to be packaged into a `.zip` file, so install **7zip** from the link in the previous section if you haven't so already, and then proceed to install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest). Again, you will need to follow the instructions to authenticate the CLI with your Azure account details.

Before deployment, we need to set up a **Function App** within the Azure web management portal. In the portal, select _Create Resource_ from the top of the left hand menu, and choose _Compute → Function App_. Enter details for the app - these do not matter to much, as long as _Runtime stack_ is set to **JavaScript**. Choose _Create new_ for the resource group, and it will generate one automatically for you based on the app name you provide.

We can now deploy the functions as follows:

```bash
cd test2-cloud-function

7z a -tzip index.zip ./

az functionapp deployment source config-zip -g <resource_group> -n <app_name> --src ./index.zip

rm ./index.zip
```

In `az` command, replace `<resource_group>` with the name of the resource group created for you earlier, and `<app_name>` with the name of the function app.

With the function app name 'adenin-functions', the endpoint would be as follows:

`https://adenin-functions.azurewebsites.net/api/:activity`

Again, you may want to configure environment variables within the function app console under 'application settings'.

Also, see the documentation on using Azure pipelines for deployment in the [Azure deployment](/docs/DeployAzure.md) documentation.