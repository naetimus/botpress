import { Button } from '@blueprintjs/core'
import { toast } from 'botpress/shared'
import { useState } from 'react'
import api from '~/api'

export const DiagReport = () => {
  const [loading, setLoading] = useState(false)

  const getDiagReport = async () => {
    setLoading(true)

    try {
      const { data } = await api.getSecured().get('/admin/server/diag')

      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([data]))
      link.download = `diagnostic.txt`
      link.click()
    } catch (err) {
      toast.failure(`Couldn't generate diagnostic report: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={getDiagReport} text={loading ? 'Please wait...' : 'Generate report'} disabled={loading}></Button>
  )
}
