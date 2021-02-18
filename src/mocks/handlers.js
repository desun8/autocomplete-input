import { rest } from 'msw';

import jsonData from './data.json';

export const handlers = [
  rest.post('/api/streets', (req, res, ctx) => {
    const searchName = req.body.toLowerCase();
    const regex = new RegExp(`^${searchName}`);
    const data = jsonData.items.map(item => item.uf_name); // нужны только названия улиц

    // Фильтруем, оставляем только подходящие значения
    const filteredData = data.filter(item => {
      return item.toLowerCase().search(regex) !== -1;
    });

    return res(
      ctx.status(200),
      ctx.json({
        results: filteredData,
        success: true
      })
    );
  })
];
