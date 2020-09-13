import { APIClient } from 'shared';
import XHR2 from 'xhr2';

const api = new APIClient(
  'http://localhost:3000',
  () => null,
  () => {
    return new XHR2();
  }
);

async function go() {
  console.log(
    await api
      .example_createFoo({
        foo: '123',
      })
      .toPromise()
  );
  console.log(await api.example_getAll().toPromise());
}

go().catch(e => {
  console.error(e);
  process.exit(1);
});
