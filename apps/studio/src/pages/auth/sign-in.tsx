import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AxiosError } from "axios";
import Logo from "ui/assets/logo.svg";
import { cn } from "ui/lib/utils";
import { useToast } from "ui/hooks/use-toast";
import { Input } from "ui/components/input";
import { Button } from "ui/components/button";
import { Loader2 } from "ui/components/icons";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "ui/components/form";

import { api } from "@/lib/utils";
import { signInSchema, type SignInSchema } from "@/lib/schema";

export default function SignInPage() {
  const { toast } = useToast();

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function signIn(values: SignInSchema) {
    try {
      await api.post("/auth/v1/sign-in", values);
      window.location.reload();
    } catch (error: AxiosError | Error | any) {
      if (error instanceof AxiosError) {
        toast({ title: error.response?.data.message, variant: "destructive" });
      } else {
        toast({ title: error.message || "Something went wrong", variant: "destructive" });
      }
    } finally {
      form.reset();
    }
  }

  const isLoading = form.formState.isSubmitting;

  return (
    <main className="animate-in zoom-in-90 h-full flex items-center justify-center">
      <section className="w-full max-w-sm flex flex-col p-6 gap-6">
        <div className="space-y-2 mb-2 tracking-wide">
          <img
            src={Logo}
            alt="Swiftcart logo"
            width={70}
            height={70}
            className="dark:invert -ml-2.5"
          />
          <h1 className="text-2xl md:text-3xl font-semibold">Welcome back</h1>
          <p className="text-muted-foreground text-sm font-medium">Sign in to your account</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(signIn)} className="space-y-6">
            <div className="space-y-3">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <sup className="text-destructive font-medium">*</sup>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        type="text"
                        placeholder="johndoe@xyz.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Password <sup className="text-destructive font-medium">*</sup>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        type="password"
                        placeholder="••••••••"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <Button
                disabled={isLoading}
                type="submit"
                className="tracking-wide flex items-center w-full"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </Form>
        <Link
          to="/auth/sign-up"
          className={cn(
            "text-sm text-muted-foreground tracking-wide mt-2 hover:underline hover:underline-offset-2 transition",
            isLoading && "pointer-events-none"
          )}
        >
          Don't have an account? Sign up
        </Link>
      </section>
    </main>
  );
}
