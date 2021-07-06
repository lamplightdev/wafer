export default [
  // String
  {
    description: 'String with initial, with reflect',
    props: {
      test: {
        type: String,
        reflect: true,
        initial: 'foo',
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: 'foo',
          attribute: 'foo',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test="bar"></wafer-test-${key}>
  `,
        attrs: { test: 'bar' },
        expected: {
          prop: 'bar',
          attribute: 'bar',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'String without initial, with reflect',
    props: {
      test: {
        type: String,
        reflect: true,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: undefined,
          attribute: null,
          changed: [],
          updated: [],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test="bar"></wafer-test-${key}>
  `,
        attrs: { test: 'bar' },
        expected: {
          prop: 'bar',
          attribute: 'bar',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'String with initial, without reflect',
    props: {
      test: {
        type: String,
        initial: 'foo',
        reflect: false,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: 'foo',
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test="bar"></wafer-test-${key}>
  `,
        attrs: { test: 'bar' },
        expected: {
          prop: 'bar',
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'String without initial, without reflect',
    props: {
      test: {
        type: String,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: undefined,
          attribute: null,
          changed: [],
          updated: [],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test="bar"></wafer-test-${key}>
  `,
        attrs: { test: 'bar' },
        expected: {
          prop: 'bar',
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  // Number
  {
    description: 'Number with initial, with reflect',
    props: {
      test: {
        type: Number,
        reflect: true,
        initial: 10,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: 10,
          attribute: '10',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test="20"></wafer-test-${key}>
  `,
        attrs: { test: '20' },
        expected: {
          prop: 20,
          attribute: '20',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Number without initial, with reflect',
    props: {
      test: {
        type: Number,
        reflect: true,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: undefined,
          attribute: null,
          changed: [],
          updated: [],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test="20"></wafer-test-${key}>
  `,
        attrs: { test: '20' },
        expected: {
          prop: 20,
          attribute: '20',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Number with initial, without reflect',
    props: {
      test: {
        type: Number,
        initial: 10,
        reflect: false,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: 10,
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test="20"></wafer-test-${key}>
  `,
        attrs: { test: '20' },
        expected: {
          prop: 20,
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Number without initial, without reflect',
    props: {
      test: {
        type: Number,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: undefined,
          attribute: null,
          changed: [],
          updated: [],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test="20"></wafer-test-${key}>
  `,
        attrs: { test: '20' },
        expected: {
          prop: 20,
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  // Boolean
  {
    description: 'Boolean with initial (true), with reflect',
    props: {
      test: {
        type: Boolean,
        reflect: true,
        initial: true,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: true,
          attribute: '',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test></wafer-test-${key}>
  `,
        attrs: { test: '' },
        expected: {
          prop: true,
          attribute: '',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Boolean with initial (false), with reflect',
    props: {
      test: {
        type: Boolean,
        reflect: true,
        initial: false,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: false,
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test></wafer-test-${key}>
  `,
        attrs: { test: '' },
        expected: {
          prop: true,
          attribute: '',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Boolean without initial, with reflect',
    props: {
      test: {
        type: Boolean,
        reflect: true,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: undefined,
          attribute: null,
          changed: [],
          updated: [],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test></wafer-test-${key}>
  `,
        attrs: { test: '' },
        expected: {
          prop: true,
          attribute: '',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Boolean with initial (true), without reflect',
    props: {
      test: {
        type: Boolean,
        initial: true,
        reflect: false,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: true,
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test></wafer-test-${key}>
  `,
        attrs: { test: '' },
        expected: {
          prop: true,
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Boolean with initial (false), without reflect',
    props: {
      test: {
        type: Boolean,
        initial: false,
        reflect: false,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: false,
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test></wafer-test-${key}>
  `,
        attrs: { test: '' },
        expected: {
          prop: true,
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Boolean without initial, without reflect',
    props: {
      test: {
        type: Boolean,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: undefined,
          attribute: null,
          changed: [],
          updated: [],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test></wafer-test-${key}>
  `,
        attrs: { test: '' },
        expected: {
          prop: true,
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  // Object
  {
    description: 'Object with initial, with reflect',
    props: {
      test: {
        type: Object,
        reflect: true,
        initial: { foo: 'bar' },
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: { foo: 'bar' },
          attribute: '{"foo":"bar"}',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test='{"foo":"baz"}'></wafer-test-${key}>
  `,
        attrs: { test: '{"foo":"baz"}' },
        expected: {
          prop: { foo: 'baz' },
          attribute: '{"foo":"baz"}',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Object without initial, with reflect',
    props: {
      test: {
        type: Object,
        reflect: true,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: undefined,
          attribute: null,
          changed: [],
          updated: [],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test='{"foo":"baz"}'></wafer-test-${key}>
  `,
        attrs: { test: '{"foo":"baz"}' },
        expected: {
          prop: { foo: 'baz' },
          attribute: '{"foo":"baz"}',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Object with initial, without reflect',
    props: {
      test: {
        type: Object,
        initial: { foo: 'bar' },
        reflect: false,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: { foo: 'bar' },
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test='{"foo":"baz"}'></wafer-test-${key}>
  `,
        attrs: { test: '{"foo":"baz"}' },
        expected: {
          prop: { foo: 'baz' },
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Object without initial, without reflect',
    props: {
      test: {
        type: Object,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: undefined,
          attribute: null,
          changed: [],
          updated: [],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test='{"foo":"baz"}'></wafer-test-${key}>
  `,
        attrs: { test: '{"foo":"baz"}' },
        expected: {
          prop: { foo: 'baz' },
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  // Array
  {
    description: 'Array with initial, with reflect',
    props: {
      test: {
        type: Object,
        reflect: true,
        initial: [1, 2, 3],
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: [1, 2, 3],
          attribute: '[1,2,3]',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test='[4,5,6]'></wafer-test-${key}>
  `,
        attrs: { test: '[4,5,6]' },
        expected: {
          prop: [4, 5, 6],
          attribute: '[4,5,6]',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Array without initial, with reflect',
    props: {
      test: {
        type: Array,
        reflect: true,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: undefined,
          attribute: null,
          changed: [],
          updated: [],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test='[4,5,6]'></wafer-test-${key}>
  `,
        attrs: { test: '[4,5,6]' },
        expected: {
          prop: [4, 5, 6],
          attribute: '[4,5,6]',
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Array with initial, without reflect',
    props: {
      test: {
        type: Array,
        initial: [1, 2, 3],
        reflect: false,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: [1, 2, 3],
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test='[4,5,6]'></wafer-test-${key}>
  `,
        attrs: { test: '[4,5,6]' },
        expected: {
          prop: [4, 5, 6],
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },

  {
    description: 'Array without initial, without reflect',
    props: {
      test: {
        type: Object,
      },
    },
    tests: [
      {
        description: 'without value',
        html: (key) => `
    <wafer-test-${key}></wafer-test-${key}>
  `,
        expected: {
          prop: undefined,
          attribute: null,
          changed: [],
          updated: [],
        },
      },
      {
        description: 'with value',
        html: (key) => `
    <wafer-test-${key} test='[4,5,6]'></wafer-test-${key}>
  `,
        attrs: { test: '[4,5,6]' },
        expected: {
          prop: [4, 5, 6],
          attribute: null,
          changed: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
          updated: [
            {
              value: new Map([['test', undefined]]),
            },
          ],
        },
      },
    ],
  },
];
