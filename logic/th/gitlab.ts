import axios from "axios";

export async function oauthToken(params) {


    console.log(process.env.CUSTOM_ENV)

    const redirect_uri = global.conf.gitlab.application.redirectUri
    const ClientId = global.conf.gitlab.application.clientId
    const clientSecret = global.conf.gitlab.application.clientSecret

    console.log(redirect_uri, ClientId, clientSecret)

    const { refresh_token: thRefreshToken, access_token: thAccessToken } =
        await axios
            .post(
                `http://git.dev.sh.ctripcorp.com/oauth/token?client_id=${ClientId}&client_secret=${clientSecret}&code=${params.code}&grant_type=authorization_code&redirect_uri=${redirect_uri}`,
            )
            .then((res) => {
                console.log(res.data, 123)
                return res.data
            })

    console.log(thRefreshToken,thAccessToken)
    return {token:'123'}
}
