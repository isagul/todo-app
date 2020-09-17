import React, { useContext, useState, useEffect } from 'react';
import { Input, Checkbox, Divider, Popconfirm, Select, Button, TimePicker, Spin } from 'antd';
import {
  QuestionCircleOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { Store } from './store';
import {
  ADD_TASK,
  SORT_BY_DATE,
  UNDO_TASK,
  SET_TASKS,
  UPDATE_STATUS_API,
  GET_FILTER_TASKS_API,
  DELETE_TASK_API
} from './actions/index';
import Countdown from 'react-countdown';
import axios from 'axios';

import './App.scss';

const dateFormat = require('dateformat');
const { Option } = Select;

const taskStatus = [
  { id: 1, label: 'All', key: 'all', icon: <UnorderedListOutlined /> },
  { id: 2, label: 'Active', key: 'active', icon: <ClockCircleOutlined /> },
  { id: 3, label: 'Completed', key: 'completed', icon: <CheckCircleOutlined /> }
]

function App() {
  const [taskName, setTaskName] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState('');
  const { state, dispatch } = useContext(Store);
  const { filteredTasks } = state;

  // console.log('state from app', state);

  useEffect(() => {
    axios.get('http://localhost:3002/task')
      .then(function (response) {
        // handle success
        if (response.status === 200) {
          dispatch({
            type: SET_TASKS,
            payload: response.data.result
          })
        }
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
  }, [dispatch]);

  function onChangeStatus(e, item) {
    setLoading(true);
    axios.post('http://localhost:3002/task/update', {
      id: item._id,
      value: e.target.checked ? 'completed' : 'active'
    })
      .then(function (response) {
        if (response.status === 200) {
          dispatch({
            type: UPDATE_STATUS_API,
            payload: {
              data: response.data.result,
              currentStatusFilter: currentFilter
            }
          });
          setLoading(false);
        }
      })
      .catch(function (error) {
        setLoading(false);
        console.log(error);
      });
  }

  function getStatus(status) {
    setLoading(true);
    axios.post('http://localhost:3002/task/by-status', {
      status: status.key
    })
      .then(function (response) {
        if (response.status === 200) {
          setCurrentFilter(status.key);
          dispatch({
            type: GET_FILTER_TASKS_API,
            payload: {
              data: response.data.result,
              currentStatusFilter: status.key
            }
          })
          setLoading(false);
        }
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      })

  }

  function addTask() {
    setLoading(true);
    axios.post('http://localhost:3002/task/create', {
      content: taskName,
      date: dateFormat(new Date()),
      targetTime: time
    })
      .then(function (response) {
        if (response.status === 200) {
          dispatch({
            type: ADD_TASK,
            payload: {
              task: response.data.addedTask,
              currentStatusFilter: currentFilter
            }
          });
          setTaskName('');
          setTime('');
          setLoading(false);
        }

      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
  }

  function deleteTask(item) {
    setLoading(true);
    axios.delete(`http://localhost:3002/task/delete-permanently/${item._id}`)
      .then(function (response) {
        if (response.status === 200) {
          dispatch({
            type: DELETE_TASK_API,
            payload: {
              data: response.data.result,
              currentStatusFilter: currentFilter
            }
          });
          setLoading(false);
        }

      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
  }

  function onChange(value) {
    dispatch({
      type: SORT_BY_DATE,
      payload: {
        sortValue: value,
        currentStatusFilter: currentFilter
      }
    });
  }

  function undoDeletedTask(item) {
    dispatch({
      type: UNDO_TASK,
      payload: item
    })
  }

  function onChangeTime(value, dateString) {
    const a = dateString.split(':');

    const seconds = ((+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2])) * 1000;
    setTime(seconds);
  }

  function timeComplete(event, item) {
    /* console.log('event', event);
    console.log('item', item); */
  }

  return (
    <div className="app-component">
      <div className="content">
        <div className="status-area">
          <Divider orientation="left">Filters</Divider>
          <ul className="status-list">
            {
              taskStatus.map(status => {
                const { icon, label, id, key } = status;
                return (
                  <li key={id} onClick={() => getStatus(status)} className={key === currentFilter ? 'active' : ''}>
                    {icon && icon} {label}
                  </li>
                )
              })
            }
          </ul>
        </div>
        <div className="add-list-area">
          <Divider>TODO APP</Divider>
          <div className="add-bar">
            <Input
              placeholder="Add task"
              size="middle"
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              onPressEnter={() => addTask()}
            />
            <TimePicker onChange={onChangeTime} style={{ width: '170px' }} />
            <Button onClick={() => addTask()}>Add</Button>
          </div>

          <Divider orientation="left">TODOS</Divider>
          {currentFilter !== 'recently_deleted' &&
            <Select
              className="list-by-date"
              showSearch
              placeholder="Sort by Date"
              optionFilterProp="children"
              onChange={onChange}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="asc"><SortAscendingOutlined /> Sort Ascending</Option>
              <Option value="desc"><SortDescendingOutlined /> Sort Descending</Option>
            </Select>}
          <Spin spinning={loading}>
            <ul className="list-tasks">
              {
                filteredTasks.length > 0 ? filteredTasks.map((item, index) => {
                  return (
                    <div key={index} className={'task ' + (item.status === 'completed' ? 'completed' : '')}>
                      <li className="task-name">
                        {
                          currentFilter !== 'recently_deleted' ?
                            <Checkbox onChange={(event) => onChangeStatus(event, item)} checked={item.status === 'completed'}>{item.content}</Checkbox> :
                            item.content
                        }
                      </li>
                      <div className="remaining-time">
                        {
                          item.targetTime &&
                          <>
                            <span>Remaining Time </span>
                            <Countdown date={Date.now() + item.targetTime} onTick={(event) => timeComplete(event, item)} />
                          </>
                        }
                      </div>
                      <div className="delete-task">
                        {
                          currentFilter !== 'recently_deleted' ?
                            <Popconfirm title="Are you sure？" icon={<QuestionCircleOutlined style={{ color: 'red' }} />} onConfirm={() => deleteTask(item)}>
                              Delete Task
                          </Popconfirm> :
                            <span className="undo" onClick={() => undoDeletedTask(item)}>Undo</span>
                        }
                      </div>
                      <span className="task-date">{item.date}</span>
                    </div>
                  )
                }) : <span>There is no any task here.</span>
              }
            </ul>
          </Spin>

          {currentFilter !== 'recently_deleted' && <span className="left-items-info"><strong>{state.tasks.filter(task => task.status === 'active').length}</strong> items left</span>}
        </div>
      </div>
    </div>
  );
}

export default App;
