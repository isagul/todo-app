import React, { useState, useContext } from 'react';
import { Input, Button, message } from 'antd';
import {
  addTask,
  setLoading
} from '../actions/index';
import { Store } from '../store';
import { axiosInstance } from '../utils/AxiosConfig';

import './AddTask.scss';

const dateFormat = require('dateformat');

const AddTask = () => {
  const [taskName, setTaskName] = useState('');
  const { state, dispatch } = useContext(Store);
  const { currentFilter } = state;

  function addTaskTodo() {
    if (taskName && taskName.trim().length > 0) {
      setLoading({ status: true }, dispatch);
      axiosInstance.post('/task/create', {
        content: taskName,
        date: dateFormat(new Date())
      })
        .then(function (response) {
          if (response.status === 200) {
            addTask({
              task: response.data.addedTask,
              currentStatusFilter: currentFilter
            }, dispatch)

            setTaskName('');
            message.success("The task was added successfully");
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .then(() => {
          setLoading({ status: false }, dispatch);
        })
    } else {
      message.warn("Please type something into todo field");
    }
  }

  return (
    <div className="add-bar">
      <Input
        placeholder="Add task"
        size="middle"
        value={taskName}
        onChange={(event) => setTaskName(event.target.value)}
        onPressEnter={() => addTaskTodo()}
      />
      <Button onClick={() => addTaskTodo()}>Add</Button>
    </div>
  )
}

export default AddTask;