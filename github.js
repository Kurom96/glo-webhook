const GitHub = require('github-api');

const gh = new GitHub({
    token: ''
});

const me = gh.getUser(); // no user specified defaults to the user for whom credentials were provided
me.listNotifications(function(err, notifications) {
    // do some stuff
    // console.log(notifications);
});

me.listStarredRepos(function(err, repos) {
    // look at all the starred repos!
    // console.log(repos);
});

me.listRepos((err, repos) => {
    // const ws = repos.filter(repo => repo.full_name === "Kurom96/visual-studio-app-center-boilerplate");
    // console.log(ws);
});

const is = gh.getIssues("User", "ripo");
is.listIssues({}, (err, issues) => {
    console.log(issues);
});
