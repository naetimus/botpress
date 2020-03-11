import { Button, FormGroup, InputGroup, Intent, Tab, Tabs, TextArea } from '@blueprintjs/core'
import axios from 'axios'
import { Topic } from 'botpress/sdk'
import { FlowView } from 'common/typings'
import _ from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { fetchTopics, renameFlow } from '~/actions'
import InjectedModuleView from '~/components/PluginInjectionSite/module'
import { BaseDialog, DialogBody } from '~/components/Shared/Interface'
import { sanitizeName } from '~/util'

import style from '../style.scss'

interface Props {
  selectedTopic: string
  isOpen: boolean
  topics: Topic[]
  flows: FlowView[]
  toggle: () => void
  renameFlow: (flow: { targetFlow: string; name: string }) => void
  fetchTopics: () => void
}

const EditTopicModal: FC<Props> = props => {
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  useEffect(() => {
    setName(props.selectedTopic)

    if (props.topics) {
      const topic = props.topics.find(x => x && x.name === props.selectedTopic)
      setDescription(topic && topic.description)
    }
  }, [props.isOpen])

  const submit = async () => {
    await axios.post(`${window.BOT_API_PATH}/mod/ndu/topic/${props.selectedTopic}`, { name, description })

    if (name !== props.selectedTopic) {
      props.flows
        .filter(f => f.name.startsWith(`${props.selectedTopic}/`))
        .forEach(f =>
          props.renameFlow({ targetFlow: f.name, name: f.name.replace(`${props.selectedTopic}/`, `${name}/`) })
        )

      // TODO: Update knowledge items
    }

    props.fetchTopics()

    closeModal()
  }

  const closeModal = () => {
    setName('')
    props.toggle()
  }

  return (
    <BaseDialog title="Edit topic" icon="edit" isOpen={props.isOpen} onClose={closeModal} size="md" onSubmit={submit}>
      <DialogBody>
        <div>
          <FormGroup label="Topic Name">
            <InputGroup
              id="input-flow-name"
              tabIndex={1}
              required={true}
              value={name}
              maxLength={50}
              onChange={e => setName(sanitizeName(e.currentTarget.value))}
              autoFocus={true}
            />
          </FormGroup>

          <FormGroup label="Description">
            <TextArea
              id="input-flow-description"
              rows={3}
              value={description}
              maxLength={250}
              fill={true}
              onChange={e => setDescription(e.currentTarget.value)}
            />
          </FormGroup>

          <Button
            type="submit"
            id="btn-submit"
            text="Save changes"
            intent={Intent.PRIMARY}
            className={style.modalFooter}
          />
        </div>
      </DialogBody>
    </BaseDialog>
  )
}

const mapStateToProps = state => ({
  flows: _.values(state.flows.flowsByName),
  topics: state.ndu.topics
})

const mapDispatchToProps = {
  renameFlow,
  fetchTopics
}

export default connect(mapStateToProps, mapDispatchToProps)(EditTopicModal)