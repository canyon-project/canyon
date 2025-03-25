"use client"

// import Report from "canyon-report";
import CommitDetailPage from "@/pages/CommitDetailPage"
import { Drawer, Button } from "antd"
import {FC, useState} from "react"

// http://localhost:8000/gitlab/org/repo/commits?sha=xxx&repo_id=9050&report_id=123&report_provider=gitlab

const CommitsPage:FC<{
  sha?: string
  repoID?: string
  reportID?: string
  reportProvider?: string
}> = ({
  sha,
  reportProvider,
  repoID,
  reportID,onSelectCommit
                     }) => {
  const [drawerVisible, setDrawerVisible] = useState(false)

  const showDrawer = () => {
    setDrawerVisible(true)
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
  }

  return (
    <>
      <div>
        <h1>Commits Page</h1>
        <p>sha: {sha}</p>
        <p>repoID: {repoID}</p>
        <p>reportID: {reportID}</p>
        <p>reportProvider: {reportProvider}</p>
      </div>
      <Button type="primary" onClick={showDrawer}>
        Open Commit Details
      </Button>

      <Button onClick={()=>{
        onSelectCommit(Math.random().toString().split('.')[1])
      }}>选择一个commit</Button>

      <Drawer
        title="Commit Details"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={'80%'}
        destroyOnClose={true}
      >
        <CommitDetailPage />
      </Drawer>
    </>
  )
}

export default CommitsPage

