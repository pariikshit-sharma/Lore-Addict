// @lore-addict/ui — shared design system package.
// Single export surface every consuming app imports from — reorganizing
// internals later never touches call sites elsewhere in the workspace.

export { cn } from "./utils/cn";

export { StarBurst } from "./icons/star-burst";

export { Button, type ButtonProps } from "./components/button";
export { Badge, type BadgeProps } from "./components/badge";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/card";
export { Input } from "./components/input";
export { Textarea } from "./components/textarea";
export { Avatar, type AvatarProps } from "./components/avatar";
export {
  SpoilerBlock,
  type SpoilerBlockProps,
} from "./components/spoiler-block";
