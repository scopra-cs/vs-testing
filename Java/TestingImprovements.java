package org.example;

public class TestingImprovements {
    //Comment method body to fix deep,nested complexity smell
    public void processEverything(String input1, String input2, String input3, String input4, String input5, String input6) {
        if (input1 != null) {
            if (input2.length() > 5) {
                if (input3.startsWith("A")) {
                    for (int i = 0; i < input4.length(); i++) {
                        if (input5.contains("error")) {
                            try {
                                if (input6.equals("specialCase")) {
                                    System.out.println("Processing special case...");
                                    helperMethod(input1, input2);
                                    helperMethod2(input3, input4);
                                } else {
                                    System.out.println("Normal processing...");
                                    helperMethod3(input5, input6, input1);
                                }
                            } catch (Exception e) {
                                System.out.println("Exception caught: " + e.getMessage());
                            }
                        }
                    }
                }
            }
        } else {
            System.out.println("Input1 was null, cannot process.");
        }
    }

    private void helperMethod(String arg1, String arg2) {
        if (arg1.length() > 10) {
            System.out.println("Long argument: " + arg1);
            nestedHelperMethod(arg2);
        } else {
            System.out.println("Short argument.");
        }
    }

    private void helperMethod2(String arg1, String arg2) {
        for (int i = 0; i < arg1.length(); i++) {
            for (int j = 0; j < arg2.length(); j++) {
                if (arg1.charAt(i) == arg2.charAt(j)) {
                    System.out.println("Common character: " + arg1.charAt(i));
                }
            }
        }
    }

    private void helperMethod3(String arg1, String arg2, String arg3) {
        System.out.println("Processing with args: " + arg1 + ", " + arg2 + arg3);
        if (arg1.contains("process")) {
            if (arg2.equals("complete")) {
                System.out.println("Process complete.");
            } else {
                System.out.println("Incomplete process.");
            }
        }
    }

    private void nestedHelperMethod(String arg) {
        if (arg.length() > 5) {
            for (int i = 0; i < 10; i++) {
                if (i % 2 == 0) {
                    System.out.println("Even index: " + i);
                } else {
                    if (arg.startsWith("B")) {
                        System.out.println("Starts with B at odd index.");
                    }
                }
            }
        }
    }

    private void evenMoreStrings(String arg) {
        if (arg.length() > 5) {
            for (int i = 0; i < 10; i++) {
                if (i % 2 == 0) {
                    System.out.println("Even index: " + i);
                } else {
                    if (arg.startsWith("B")) {
                        System.out.println("Starts with B at odd index.");
                    }
                }
            }
        }
    }

    //Comment this method out to fix bumpy road ahead, code duplication and deep, nested complexity
    private void ev3enMoreStrings(String arg) {
        if (arg.length() > 5) {
            for (int i = 0; i < 10; i++) {
                if (i % 2 == 0) {
                    System.out.println("Even index: " + i);
                } else {
                    if (arg.startsWith("B")) {
                        System.out.println("Starts with B at odd index.");
                    }
                }
            }
        }
    }

    public static void main(String[] args) {
        TestingImprovements example = new TestingImprovements();
        example.processEverything("Alpha", "Bravo", "Charlie", "Delta", "error", "specialCase");
    }
}
