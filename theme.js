// theme.js
import { extendTheme } from 'native-base';

const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        borderWidth: 1, // enforce numeric border
      },
      defaultProps: {
        variant: 'solid', // optional: prevent default to "outline"
      },
    },
    Input: {
      baseStyle: {
        borderWidth: 1, // enforce numeric border
      },
    },
    Checkbox: {
      baseStyle: {
        borderWidth: 1, // optional, just to be safe
      },
    },
  },
});

export default theme;
