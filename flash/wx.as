package 
{

	import flash.display.MovieClip;
	import flash.net.*;
	import flash.events.*;
	import flash.system.Security;
	import flash.external.ExternalInterface;


	public class wx extends MovieClip
	{
		var fileRef:Object;
		var cookies:String;
		var mult:String = getFlashVars("mult");
		var type:String = "*.*;";

		public function wx()
		{
			Security.allowDomain("*");
			fileRef = new FileReference();
			ExternalInterface.addCallback("loadData",OnLoad);
			ExternalInterface.addCallback("saveData",OnSave);
			ExternalInterface.addCallback("deleteData",OnDelete);

			if (mult == "true")
			{
				fileRef = new FileReferenceList();
			}
			else
			{
				fileRef = new FileReference();
			}

			uploadBtn.addEventListener(MouseEvent.CLICK, browseHandler);
			fileRef.addEventListener(Event.SELECT,selectHandler);
			//选择文件;
			fileRef.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA,uploadCompleteDataHandler);
			fileRef.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			fileRef.addEventListener(ProgressEvent.PROGRESS, progressHandler);

			ExternalInterface.call("wxFlashLoaded");
		}


		private function OnSave(key:String,val:String):int
		{
			try
			{

				var wx:SharedObject = SharedObject.getLocal("wx","/");
				delete wx.data[key];
				wx.flush();
				wx.data[key] = val;
				wx.flush();
			}
			catch (e:Error)
			{
				return 0;
			}
			finally
			{
				return 1;
			}
		}

		private function OnLoad(key:String):String
		{
			var wx:SharedObject = SharedObject.getLocal("wx","/");
			if (wx.data[key])
			{
				return wx.data[key];
			}
			else
			{
				return "";
			}

		}
		private function OnDelete(key:String):int
		{
			try
			{
				var wx = SharedObject.getLocal("wx","/");
				delete (wx.data[key]);
				wx.flush();
			}
			catch (e:Error)
			{
				return 0;
			}
			finally
			{
				return 1;
			}
		}


		function browseHandler(event:MouseEvent):void
		{
			var loadType:String = "|" + getFlashVars("type");
			if (loadType)
			{
				type = loadType.split("|").join(";*.");
			}

			fileRef.browse(new Array(new FileFilter("请选择文件", type)));
		}
		function selectHandler(event:Event):void
		{
			var before:Boolean = true;
			var variables:URLVariables = new URLVariables();
			var param:String = getFlashVars("param");

			if (param)
			{
				var item:Array = param.split("&");
				for (var index:int; index<item.length; index++)
				{
					var urlVar:Array = item[index].split("=");
					variables[urlVar[0]] = urlVar[1];
				}
			}


			if (mult == "true")
			{
				if (getFlashVars("before"))
				{
					before = ExternalInterface.call("wxUploadFlashBefore","");
				}
				if (! before)
				{
					return;
				}
				var request:URLRequest = new URLRequest(getFlashVars("url"));
				request.method = URLRequestMethod.POST;
				if (param)
				{
					request.data = variables;
				}
				var file:FileReference;
				var files:FileReferenceList = FileReferenceList(event.target);
				var selectedFileArray:Array = files.fileList;

				for (var i:uint = 0; i < selectedFileArray.length; i++)
				{
					file = FileReference(selectedFileArray[i]);
					file.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA, uploadCompleteDataHandler);
					file.addEventListener(ProgressEvent.PROGRESS, progressHandler);

					file.upload(request, getFlashVars("name"), false);
				}
			}
			else
			{
				if (getFlashVars("size") != "null")
				{
					if (fileRef.size > parseInt(getFlashVars("size")))
					{
						ExternalInterface.call("wxUploadFlashError","{status:2}");
						return;
					}
				}

				if (getFlashVars("before"))
				{
					before = ExternalInterface.call("wxUploadFlashBefore","");
				}
				if (! before)
				{
					return;
				}

				var req:URLRequest = new URLRequest(getFlashVars("url"));
				if (param)
				{
					req.data = variables;
				}
				req.method = URLRequestMethod.POST;
				fileRef.upload(req, getFlashVars("name"), false);
			}
		}

		function uploadCompleteDataHandler(event:DataEvent):void
		{
			ExternalInterface.call("wxUploadFlashComplete",event.data);
		}

		function progressHandler(event:ProgressEvent):void
		{
			if (getFlashVars("progress"))
			{
				ExternalInterface.call(getFlashVars("progress"),(event.bytesLoaded/event.bytesTotal));
			}
		}

		function ioErrorHandler(event:IOErrorEvent):void
		{
			ExternalInterface.call("wxUploadFlashError","{status:0}");
		}

		function getFlashVars(parName)
		{
			var parValue:String = stage.loaderInfo.parameters[parName];
			if (parValue==null)
			{
				return "";
			}
			else
			{
				return parValue;
			}

		}


	}
}