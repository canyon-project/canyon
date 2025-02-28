import { useState, useEffect } from 'react';
import { Layout, Spin } from 'antd';
import CommitList from './components/CommitList';
import PipelineDetails from './components/PipelineDetails';
import TestCoverageChart from './components/TestCoverageChart';
import TestResultsChart from './components/TestResultsChart';
import TestTypeSegmenter from './components/TestTypeSegmenter';
import AggregationProgress from './components/AggregationProgress';
import RepositoryOverview from './components/RepositoryOverview';
import CommitOverview from './components/CommitOverview';
import { fetchCommits } from './services/api';
import './App.css';

const { Header, Content, Sider } = Layout;

function App() {
  const [commits, setCommits] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [testType, setTestType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCommits();
        setCommits(data);
        if (data.length > 0) {
          setSelectedCommit(data[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch commits:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCommitSelect = (commit) => {
    setSelectedCommit(commit);
  };

  const handleTestTypeChange = (type) => {
    setTestType(type);
  };

  return (
      <div style={{
        width:'1150px',
        margin:'0 auto'
      }}>
        <Layout style={{ minHeight: '100vh' }}>
          <Header className="header">
            <div className="logo">Pipeline Coverage Dashboard</div>
          </Header>
          {/* Repository-level overview */}
          <RepositoryOverview />
          <div style={{height:'20px'}}></div>
          <Layout>
            <Sider width={300} className="site-layout-background">
              <CommitList
                  commits={commits}
                  onCommitSelect={handleCommitSelect}
                  selectedCommit={selectedCommit}
              />
            </Sider>
            <Layout style={{ padding: '0 24px 24px' }}>
              <Content className="site-layout-background" style={{ padding: 24, margin: 0, minHeight: 280 }}>
                {loading ? (
                    <div className="loading-container">
                      <Spin size="large" tip="Loading data..." />
                    </div>
                ) : (
                    <>

                      {selectedCommit ? (
                          <>
                            {/* Commit-specific overview */}
                            <CommitOverview commit={selectedCommit} />

                            <TestTypeSegmenter
                                activeType={testType}
                                onChange={handleTestTypeChange}
                            />
                            <AggregationProgress commit={selectedCommit} testType={testType} />
                            <div className="charts-container">
                              <TestCoverageChart commit={selectedCommit} testType={testType} />
                              <TestResultsChart commit={selectedCommit} testType={testType} />
                            </div>
                            <PipelineDetails commit={selectedCommit} testType={testType} />
                          </>
                      ) : (
                          <div className="empty-state">Please select a commit to view details</div>
                      )}
                    </>
                )}
              </Content>
            </Layout>
          </Layout>
        </Layout>
      </div>
  );
}

export default App;
