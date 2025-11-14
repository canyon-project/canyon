// import uploadMapMock from "./mock/upload-map";
const  uploadMapMock = require("./mock/upload-map");

fetch(`http://localhost:8080/coverage/client`,{
    method: 'POST',
    headers:{
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        "provider": "gitlab",
        "instrumentCwd": "/Users/zhangtao25/github.com/canyon-project/unit-testing-collection",
        "sha": "9b15ac0c7ca117e2d6e7156ab72e57db1f517d11",
        "branch": "dev",
        "reportID": "666666",
        "compareTarget": "dev",
        "buildProvider": "gitlab_runner",
        "buildID": "118127909",
        "repoID": "130830",
        "reportProvider": "flytest",
        coverage: uploadMapMock
    })
}).then(r=>r.json()).then(r=>{
    console.log(r)
})