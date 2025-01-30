window["components/old-ui/components/page/login/LoginBtn.tsx"] = {
  "content": "import { FC } from \"react\";\n\nimport github from \"../../../../../assets/img/github.svg\";\nimport gitlab from \"../../../../../assets/img/gitlab.svg\";\nimport google from \"../../../../../assets/img/google.svg\";\n// import img from '../../../../../assets/img/img.png';\n\nconst LoginBtn: FC<{\n  oauthUrl: { google?: string; github?: string; gitlab?: string };\n}> = ({ oauthUrl }) => {\n  return (\n    <div\n      className={\n        \"flex flex-col gap-3 w-[250px] items-center justify-around py-10 pl-5\"\n      }\n    >\n      <Button\n        type=\"default\"\n        className={\"w-full text-left\"}\n        disabled={!oauthUrl.google}\n      >\n        <img src={google} alt=\"\" className={\"w-[14px] mr-2 mt-[-2px]\"} />\n        Sign in with Google\n      </Button>\n      <Button\n        type=\"default\"\n        className={\"w-full text-left\"}\n        disabled={!oauthUrl.github}\n      >\n        <img src={github} alt=\"\" className={\"w-[14px] mr-2 mt-[-2px]\"} />\n        Sign in with Github\n      </Button>\n\n      <Button\n        type=\"default\"\n        className={\"w-full text-left\"}\n        href={oauthUrl.gitlab}\n        disabled={!oauthUrl.gitlab}\n      >\n        <img src={gitlab} alt=\"\" className={\"w-[14px] mr-2 mt-[-2px]\"} />\n        Sign in with Gitlab\n      </Button>\n    </div>\n  );\n};\nexport default LoginBtn;\n",
  "coverage": {
    "path": "components/old-ui/components/page/login/LoginBtn.tsx",
    "b": {},
    "f": {
      "0": 0
    },
    "s": {
      "0": 8,
      "1": 0
    },
    "branchMap": {},
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 10,
            "column": 5
          },
          "end": {
            "line": 10,
            "column": 6
          }
        },
        "loc": {
          "start": {
            "line": 10,
            "column": 23
          },
          "end": {
            "line": 45,
            "column": 1
          }
        },
        "line": 10
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 10,
          "column": 5
        },
        "end": {
          "line": 45,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 11,
          "column": 2
        },
        "end": {
          "line": 44,
          "column": 4
        }
      }
    }
  }
}