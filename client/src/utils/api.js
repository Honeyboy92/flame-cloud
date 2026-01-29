import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const createApiClient = () => {
    const query = (table, method = 'GET', data = null) => {
        let url = `${API_BASE}/api/${table}`;
        const params = {};

        const builder = {
            select: (cols) => builder,
            eq: (col, val) => {
                params[col] = val;
                return builder;
            },
            order: (col, { ascending = true } = {}) => {
                params.sort = col;
                params.order = ascending ? 'asc' : 'desc';
                return builder;
            },
            single: () => {
                params.single = true;
                return builder;
            },
            insert: (items) => query(table, 'POST', Array.isArray(items) ? items[0] : items),
            then: async (onSuccess, onError) => {
                try {
                    const config = { params };
                    let res;
                    if (method === 'POST') {
                        res = await axios.post(url, data);
                    } else if (method === 'PUT') {
                        res = await axios.put(url, data);
                    } else if (method === 'DELETE') {
                        res = await axios.delete(url, { params });
                    } else {
                        res = await axios.get(url, { params });
                    }

                    let resultData = res.data;
                    if (params.single && Array.isArray(resultData)) {
                        resultData = resultData[0] || null;
                    }

                    const result = { data: resultData, error: null };
                    if (onSuccess) return onSuccess(result);
                    return result;
                } catch (err) {
                    const result = { data: null, error: err.response?.data || err };
                    if (onError) return onError(result);
                    if (onSuccess) return onSuccess(result);
                    return result;
                }
            }
        };

        return builder;
    };

    return {
        from: (table) => query(table)
    };
};

export const api = createApiClient();
