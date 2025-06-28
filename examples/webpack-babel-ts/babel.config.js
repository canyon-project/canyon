module.exports = {
  plugins: ['istanbul',[
    'canyon',{
      keepMap: true,
      ci: true,
    }
  ]]
};
