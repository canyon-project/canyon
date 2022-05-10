import {oauthToken as logicThGitlab} from "../../../logic/th/gitlab";

const logic = {
    th:{
        gitlab:{
            oauthToken:logicThGitlab
        }
    }
}

export async function oauthHandler(req,res) {
    res.send(await logic.th.gitlab.oauthToken({code:req.body.code}))
}
