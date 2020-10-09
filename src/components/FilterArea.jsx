import React, { useContext } from 'react';
import { axiosInstance } from '../utils/AxiosConfig';
import { filterTasks, setLoading, setCurrentPage, setCurrentFilter } from '../actions/index';
import {
  CheckCircleOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  RestOutlined
} from '@ant-design/icons';
import { Store } from '../store';
import './FilterArea.scss';

const taskStatus = [
  { id: 1, label: 'All', key: 'all', icon: <UnorderedListOutlined /> },
  { id: 2, label: 'Active', key: 'active', icon: <ClockCircleOutlined /> },
  { id: 3, label: 'Completed', key: 'completed', icon: <CheckCircleOutlined /> },
  { id: 4, label: 'Recently Deleted', key: 'deleted', icon: <RestOutlined /> }
];

const FilterArea = () => {
  const { state, dispatch } = useContext(Store);
  const { currentFilter } = state;

  function getStatus(status) {
    setLoading({
      status: true
    }, dispatch);
    axiosInstance.post('/task/by-status', {
      status: status.key
    })
      .then(function (response) {
        if (response.status === 200) {
          setCurrentFilter({
            value: status.key
          }, dispatch);

          filterTasks({
            data: response.data.result,
            currentStatusFilter: status.key
          }, dispatch);

          setCurrentPage({
            value: 1
          }, dispatch);
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(() => {
        setLoading({
          status: false
        }, dispatch);
      })

  }

  return (
    <div className="filter-component">
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
  )
}

export default FilterArea;