import { useEffect } from 'react'
import BasicLayout from '@/layouts/BasicLayout.tsx'
import { useNavigate } from 'react-router-dom'

const IndexPage = () => {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(`/projects`)
  })
  return (
    <BasicLayout>
      <span className={'bg-amber-500'}>IndexPage</span>
    </BasicLayout>
  )
}

export default IndexPage
