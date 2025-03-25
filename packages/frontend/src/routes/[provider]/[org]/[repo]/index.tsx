"use client"

import {Outlet, useLocation, useNavigate, useParams, useSearchParams} from "react-router-dom"
import { Tabs } from "antd"
import { useEffect, useState } from "react"
import BaseLayout from "@/layouts/BaseLayout";


// http://localhost:8000/gitlab/org/repo/commits?

const RepoPage = () => {
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()



  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Extract the last part of the URL path
    const pathParts = location.pathname.split("/")
    const lastPart = pathParts[pathParts.length - 1]

    // Check if the last part matches one of our tab keys
    if (lastPart === "commits" || lastPart === "overview") {
      setActiveTab(lastPart)
    }

    console.log(location.pathname, params)
  }, [location.pathname, params])

  const handleTabChange = (key) => {
    // Update URL when tab changes (optional)
    const basePath = location.pathname.split("/").slice(0, -1).join("/")
    // window.history.pushState({}, "", `${basePath}/${key}`)
    navigate(`${basePath}/${key}`)
    setActiveTab(key)
  }

  return (
    <BaseLayout>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            label: "Commits",
            key: "commits",
          },
          {
            label: "Overview",
            key: "overview",
          },
        ]}
      />
      <Outlet />
    </BaseLayout>
  )
}

export default RepoPage

