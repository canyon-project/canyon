import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class CoverageGitService {
  async fetchGitLabFile(
    baseUrl: string,
    projectId: string,
    sha: string,
    path: string,
    headers: Record<string, string>,
  ): Promise<string> {
    const filePath = encodeURIComponent(path)
    const url = `${baseUrl}/api/v4/projects/${projectId}/repository/files/${filePath}/raw`
    const resp = await axios.get(url, {
      headers,
      params: { ref: sha },
      responseType: 'text',
    })
    if (resp.status < 200 || resp.status >= 300) return ''
    return resp.data as string
  }
}
