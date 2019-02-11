/**
 * @class Logger
 */

const Logger = {
  notify: (err: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(err);
    }
  }
};

export default Logger;
