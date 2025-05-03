module.exports = {
  plugins: ['istanbul',[
    'canyon',{
      keepMap: false,
      ci: true,
    }
  ]]
};
