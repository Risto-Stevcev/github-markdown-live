# github-markdown-live

:octocat: A simple way to render and view your GitHub markdown files locally.


## Usage

Choose a markdown file to watch and then direct your browser to the server url (default is `localhost:3000`). The server will display your markdown file exactly how GitHub would render it, and every time you save your file, the browser will automatically re-render the view without having to hit refresh.

```bash
$ github-markdown-live [-d] [-p [port]] [-a [authentication]] -f [markdown file]
```

`port` - The port to use for the server (default: 3000)  
`authentication` - Authenticate your requests using OAuth or Basic authentication ([oauthkey] | [username:password] | [username:oauthkey])  
`markdown file` - The markdown file to watch (required)  
`debug` - Prints the GitHub generated markdown to console

```bash
$ cd github-project
$ github-markdown-live -f README.md
[ --  -- ] Listening on *:3000
```

## How It Works

The styling and rendering is exactly how it will appear on GitHub because it uses GitHub's CSS stylsheets and it also uses the GitHub API to parse the markdown file into the HTML format that GitHub uses. All GitHub markdown features are supported as a result, including emojis. 

The rendered view in the browser updates automatically without needing to hit refresh because it uses WebSockets (via socket.io) to update it live.


## Request Limit

The [request limit](https://developer.github.com/v3/#rate-limiting) for the current GitHub API version (v3) is up to 60 requests/hour as an unauthenticated user. This is plenty for most people using the library, but if you find that you are running out of requests, you can authenticate using Basic or OAuth authentication, which will increase the rate to 5000 requests/hour.

OAuth is recommended over Basic because you can limit the scope of what can be accessed with the key, and you can always revoke any key you create. You can create an OAuth token [here](https://github.com/settings/tokens/new).

All requests made by this app are sent via `https`, which will protect your credentials if you decide to use `username:password` Basic authentication.


## Changelog

- **v1.0.5**
  - Removes line breaks from the markdown to match the GitHub flavor
  - Added `-d, --debug` to print the GitHub generated markdown to console

- **v1.0.2**
  - Initial stable release


## License

Licensed under the MIT license.
