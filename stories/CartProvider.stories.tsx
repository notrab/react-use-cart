import React from "react";
import { Meta, Story } from "@storybook/react";
import { CartProvider } from "../src";

const meta: Meta = {
  title: "Welcome",
  component: CartProvider,
  argTypes: {
    children: {
      control: {
        type: "text",
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story = (args) => <CartProvider {...args} />;

export const Default = Template.bind({});

Default.args = {};
