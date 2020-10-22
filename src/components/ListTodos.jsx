import React, { useContext } from 'react';
import { Checkbox, Popconfirm, Spin, Pagination } from 'antd';
import {
  QuestionCircleOutlined
} from '@ant-design/icons';
import {
  deleteTaskPerm,
  deleteTaskTemp,
  updateStatus,
  setLoading,
  setCurrentPage
} from '../actions/index';
import { axiosInstance } from '../utils/AxiosConfig';
import { Store } from '../store';
import './ListTodos.scss';

const ListTodos = () => {
  const { state, dispatch } = useContext(Store);
  const { filteredTasks, loading, currentPage, currentFilter, sortingValue } = state;
  const linksPerPage = 5;

  function getCurrentTasks() {
    const indexOfLastLink = currentPage * linksPerPage;
    const indexOfFirstLink = indexOfLastLink - linksPerPage;
    return filteredTasks.slice(indexOfFirstLink, indexOfLastLink);
  }

  function getPaginationChange(page) {
    setCurrentPage({ value: page }, dispatch);
  }

  function onChangeStatus(e, item) {
    setLoading({ status: true }, dispatch);
    axiosInstance.post('/task/update', {
      id: item._id,
      value: e.target.checked ? 'completed' : 'active'
    })
      .then(function (response) {
        if (response.status === 200) {
          updateStatus({
            data: response.data.result,
            currentStatusFilter: currentFilter
          }, dispatch)
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(() => {
        setLoading({ status: false }, dispatch);
      })
  }

  function deleteTaskPermanently(item) {
    setLoading({ status: true }, dispatch);
    axiosInstance.delete(`/task/delete-permanently/${item._id}`)
      .then(function (response) {
        if (response.status === 200) {
          deleteTaskPerm({
            data: response.data.result,
            currentStatusFilter: currentFilter
          }, dispatch)
          if (getCurrentTasks().length === 1) {
            if (currentPage > 1) {
              setCurrentPage({ value: currentPage - 1 }, dispatch);
            }
          }
        }

      })
      .catch(function (error) {
        console.log(error);
      })
      .then(() => {
        setLoading({ status: false }, dispatch);
      })
  }

  function deleteTaskTemporarily(item) {
    axiosInstance.post('/task/delete-temporarily', {
      id: item._id
    })
      .then(function (response) {
        setLoading({ status: true }, dispatch);
        if (response.status === 200) {
          deleteTaskTemp({
            data: response.data.result.filter(item => item.status !== 'deleted'),
            currentStatusFilter: currentFilter
          }, dispatch)
          if (getCurrentTasks().length === 1) {
            if (currentPage > 1) {
              setCurrentPage({ value: currentPage - 1 }, dispatch);
            }
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(() => {
        setLoading({ status: false }, dispatch);
      })
  }

  return (
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
      {
        currentFilter !== 'deleted' && <div className="left-items-info"><strong>{state.tasks.filter(task => task.status === 'active').length}</strong> item/s left</div>
      }
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
    </Spin>
  )
}

export default ListTodos;