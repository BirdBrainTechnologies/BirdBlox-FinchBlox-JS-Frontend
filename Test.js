function Test(){
	var stack1;
	stack1=new BlockStack(new b_whenFlagTapped(20,45));
	stack1=new BlockStack(new b_Repeat(20,105));
	stack1=new BlockStack(new b_IfElse(20,165));
	stack1=new BlockStack(new b_HummingbirdLed(20,225));
	stack1=new BlockStack(new b_HummingbirdTriLed(20,285));
	stack1=new BlockStack(new b_SayThis(20,345));
	stack1=new BlockStack(new b_Wait(20,405));
	stack1=new BlockStack(new b_WaitUntil(20,465));
	stack1=new BlockStack(new b_HummingbirdLight(20,525));
	stack1=new BlockStack(new b_HBTempC(20,585));
	
	stack1=new BlockStack(new b_SayForSecs(320,45));
	stack1=new BlockStack(new b_Say(320,75));
	stack1=new BlockStack(new b_ThinkForSecs(320,105));
	stack1=new BlockStack(new b_Think(320,135));
	stack1=new BlockStack(new b_ChangeSizeBy(320,165));
	stack1=new BlockStack(new b_SetSizeTo(320,195));
	stack1=new BlockStack(new b_Size(320,230));
	stack1=new BlockStack(new b_Show(320,255));
	stack1=new BlockStack(new b_Hide(320,285));
	stack1=new BlockStack(new b_GoToFront(320,315));
	stack1=new BlockStack(new b_GoBackLayers(320,345));
	stack1=new BlockStack(new b_HummingbirdLed(320,385));
	stack1=new BlockStack(new b_HummingbirdMotor(320,500));
	
	
	stack1=new BlockStack(new b_DeviceOrientation(620,45));
	stack1=new BlockStack(new b_Add(620,105));
	stack1=new BlockStack(new b_Subtract(620,165));
	stack1=new BlockStack(new b_Multiply(620,225));
	stack1=new BlockStack(new b_Divide(620,285));
	stack1=new BlockStack(new b_Round(620,345));
	stack1=new BlockStack(new b_PickRandom(620,405));
	stack1=new BlockStack(new b_LessThan(620,465));
	stack1=new BlockStack(new b_EqualTo(620,525));
	stack1=new BlockStack(new b_GreaterThan(620,585));
	
	stack1=new BlockStack(new b_And(920,45));
	stack1=new BlockStack(new b_Or(920,105));
	stack1=new BlockStack(new b_Not(920,165));
	stack1=new BlockStack(new b_True(920,225));
	stack1=new BlockStack(new b_False(920,285));
	stack1=new BlockStack(new b_LetterOf(920,345));
	stack1=new BlockStack(new b_LengthOf(920,405));
	stack1=new BlockStack(new b_LessThan(920,465));
	stack1=new BlockStack(new b_EqualTo(920,525));
	stack1=new BlockStack(new b_GreaterThan(920,585));
}