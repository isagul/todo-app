import React, { useContext, useState, useEffect } from 'react';
import { Input, Checkbox, Divider, Popconfirm, Select, Button, DatePicker, Spin, Pagination } from 'antd';
import {
  QuestionCircleOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  RestOutlined
} from '@ant-design/icons';
import { Store } from './store';
import {
  ADD_TASK,
  SORT_BY_DATE,
  SET_TASKS,
  UPDATE_STATUS_API,
  GET_FILTER_TASKS_API,
  DELETE_TASK_PERM_API,
  DELETE_TASK_TEMP_API
} from './actions/index';
import Countdown from 'react-countdown';
import { toast } from 'react-toastify';
import axios from 'axios';
import './App.scss';

const dateFormat = require('dateformat');
const { Option } = Select;

const taskStatus = [
  { id: 1, label: 'All', key: 'all', icon: <UnorderedListOutlined /> },
  { id: 2, label: 'Active', key: 'active', icon: <ClockCircleOutlined /> },
  { id: 3, label: 'Completed', key: 'completed', icon: <CheckCircleOutlined /> },
  { id: 4, label: 'Recently Deleted', key: 'deleted', icon: <RestOutlined /> }
];

axios.defaults.baseURL = 'https://api-savenote.herokuapp.com';
// axios.defaults.baseURL = 'http://localhost:3002';

function App() {
  const [taskName, setTaskName] = useState('');  // it holds new task that will be added
  const [currentFilter, setCurrentFilter] = useState('all'); // it holds filter name located on the left side of the page
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(null); // it holds date selected from the datepicker
  const [currentPage, setCurrentPage] = useState(1);
  const linksPerPage = 5;

  const { state, dispatch } = useContext(Store);
  const { filteredTasks } = state;

  useEffect(() => {
    setLoading(true);
    axios.get('/task')
      .then(function (response) {
        // handle success
        if (response.status === 200) {
          dispatch({
            type: SET_TASKS,
            payload: response.data.result.filter(task => task.status !== 'deleted')
          })
          setLoading(false);
        }
      })
      .catch(function (error) {
        // handle error
        setLoading(false);
        console.log(error);
      })
  }, [dispatch]);

  function getCurrentTasks() {
    const indexOfLastLink = currentPage * linksPerPage;
    const indexOfFirstLink = indexOfLastLink - linksPerPage;
    return filteredTasks.slice(indexOfFirstLink, indexOfLastLink);
  }

  function getPaginationChange(page) {
    setCurrentPage(page);
  }

  function onChangeStatus(e, item) {
    setLoading(true);
    axios.post('/task/update', {
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
    axios.post('/task/by-status', {
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
          setCurrentPage(1);
        }
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      })

  }

  function addTask() {
    if (taskName && taskName.trim().length > 0) {
      setLoading(true);
      axios.post('/task/create', {
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
            setLoading(false);
            toast.success("The task was added successfully");
          }

        })
        .catch(function (error) {
          console.log(error);
          setLoading(false);
        });
    } else {
      toast.warn("Please type something into todo field");
    }

  }

  function deleteTaskPermanently(item) {
    setLoading(true);
    axios.delete(`/task/delete-permanently/${item._id}`)
      .then(function (response) {
        if (response.status === 200) {
          dispatch({
            type: DELETE_TASK_PERM_API,
            payload: {
              data: response.data.result,
              currentStatusFilter: currentFilter
            }
          });
          setLoading(false);
          if (getCurrentTasks().length === 1) {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
            }
          }
        }

      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
  }

  function deleteTaskTemporarily(item) {
    axios.post('/task/delete-temporarily', {
      id: item._id
    })
      .then(function (response) {
        setLoading(true);
        if (response.status === 200) {
          dispatch({
            type: DELETE_TASK_TEMP_API,
            payload: {
              data: response.data.result.filter(item => item.status !== 'deleted'),
              currentStatusFilter: currentFilter
            }
          });
          setLoading(false);
          if (getCurrentTasks().length === 1) {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
            }
          }
        }
      })
      .catch(function (error) {
        setLoading(false);
        console.log(error);
      });
  }

  function onChangeSortByDate(value) {
    dispatch({
      type: SORT_BY_DATE,
      payload: {
        sortValue: value,
        currentStatusFilter: currentFilter
      }
    });
  }

  function onChangeTime(value) {
    if (value !== null) {
      const seconds = value._d - new Date();
      setTime(seconds);
    } else {
      setTime(value);
    }
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
            <DatePicker showTime onChange={onChangeTime} />
            <Button onClick={() => addTask()}>Add</Button>
          </div>

          <Divider orientation="left">TODOS</Divider>
          {currentFilter !== 'deleted' &&
            <Select
              className="list-by-date"
              showSearch
              placeholder="Sort by Date"
              optionFilterProp="children"
              onChange={onChangeSortByDate}
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
                filteredTasks.length > 0 ? getCurrentTasks().map((item, index) => {
                  return (
                    <div key={index} className={'task ' + (item.status === 'completed' ? 'completed' : '')}>
                      <li className="task-name">
                        <Checkbox
                          onChange={(event) => onChangeStatus(event, item)}
                          checked={item.status === 'completed'}
                          disabled={item.status === 'deleted'}
                        >
                          {item.content}
                        </Checkbox>
                      </li>
                      <div className="remaining-time">
                        {
                          item.targetTime && item.status !== 'deleted' &&
                          <>
                            <span>Remaining Time </span>
                            <Countdown
                              date={Date.now() + item.targetTime}
                            />
                          </>
                        }
                      </div>
                      <div className="delete-task">
                        {
                          item.status !== 'deleted' ?
                            <Popconfirm
                              disabled={item.status === 'deleted'}
                              title="Are you sure？"
                              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                              onConfirm={() => deleteTaskTemporarily(item)}>
                              Delete
                            </Popconfirm> :
                            <Popconfirm
                              title="Are you sure"
                              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                              onConfirm={() => deleteTaskPermanently(item)}>
                              Delete Permanently
                            </Popconfirm>
                        }
                      </div>
                      <span className="task-date">{item.date}</span>
                    </div>
                  )
                }) : <span>There is no task here.</span>
              }
            </ul>
          </Spin>

          {currentFilter !== 'deleted' && <span className="left-items-info"><strong>{state.tasks.filter(task => task.status === 'active').length}</strong> items left</span>}
          {
            filteredTasks.length > 0 &&
            <Pagination
              defaultCurrent={1}
              current={currentPage}
              total={filteredTasks.length}
              pageSize={linksPerPage}
              onChange={getPaginationChange}
            />
          }
        </div>
      </div>
    </div>
  );
}

export default App;
